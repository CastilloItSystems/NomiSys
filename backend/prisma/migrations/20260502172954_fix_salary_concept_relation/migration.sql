-- AddForeignKey
ALTER TABLE "employee_concepts" ADD CONSTRAINT "employee_concepts_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "salary_concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
