CREATE TYPE "public"."material_kind" AS ENUM('slides', 'pdf', 'link', 'arquivo');--> statement-breakpoint
CREATE TABLE "lesson_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"title" text NOT NULL,
	"kind" "material_kind" DEFAULT 'pdf' NOT NULL,
	"url" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson_materials" ADD CONSTRAINT "lesson_materials_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_materials_lesson_id_position_key" ON "lesson_materials" USING btree ("lesson_id","position");